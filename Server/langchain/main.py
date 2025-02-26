from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client
import httpx
import redis
import json
import hashlib
from datetime import timedelta

# Import LangChain components
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms.ollama import Ollama
from langchain.schema import Document
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_redis import RedisCache, RedisSemanticCache

# Load environment variables
load_dotenv()

app = FastAPI(title="Chatree LangChain API")

# Configure Supabase client
supabase_url = os.environ.get("SUPABASE_URL", "http://supabase:8000")
supabase_key = os.environ.get("SUPABASE_KEY", os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key"))

# Mejorar la inicialización del cliente Supabase con manejo de errores
try:
    # Configurar el cliente sin parámetros adicionales que podrían causar conflictos
    supabase = create_client(supabase_url, supabase_key)
    print(f"Supabase client initialized successfully with URL: {supabase_url}")
except Exception as e:
    print(f"Error initializing Supabase client: {str(e)}")
    # Fallback to None if initialization fails, we'll check this later when needed
    supabase = None

# Configure Redis
redis_url = os.environ.get("REDIS_URL", "redis://redis:6379")
redis_password = os.environ.get("REDIS_PASSWORD", "redis")
redis_client = redis.Redis.from_url(
    url=redis_url,
    password=redis_password,
    decode_responses=True
)

# Configure Ollama
ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://ollama:11434")

# Initialize embeddings model
embeddings = OllamaEmbeddings(
    base_url=ollama_base_url,
    model="llama3"
)

# Initialize LLM with cache
llm_cache = RedisCache(
    redis_client=redis_client,
    ttl=timedelta(hours=24)
)

llm = Ollama(
    base_url=ollama_base_url,
    model="llama3:8b",
    temperature=0.7,
    cache=llm_cache
)

# Initialize semantic cache for RAG
semantic_cache = RedisSemanticCache(
    redis_url=redis_url,
    embedding=embeddings,
    redis_password=redis_password,
    namespace="chatree:rag",
    score_threshold=0.85
)

# Models
class DocumentInput(BaseModel):
    content: str
    metadata: Dict[str, Any] = {}

class AgentConfig(BaseModel):
    user_id: str
    agent_id: str
    agent_name: str
    vector_store_table: Optional[str] = "documents"
    
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatInput(BaseModel):
    user_id: str
    agent_id: str
    message: str
    chat_history: Optional[List[ChatMessage]] = None
    use_cache: Optional[bool] = True

class ChatResponse(BaseModel):
    response: str
    source: str = "llm"  # "cache" or "llm"
    
# Utility functions
def get_vector_store(user_id: str, agent_id: str, table_name: str = "documents"):
    """Get a vector store for a specific user's agent"""
    return SupabaseVectorStore(
        client=supabase,
        embedding=embeddings,
        table_name=table_name,
        query_name="match_documents",
        filter={"user_id": user_id, "agent_id": agent_id}
    )

def get_retrieval_chain(user_id: str, agent_id: str):
    """Create a retrieval chain for a specific user's agent"""
    vectorstore = get_vector_store(user_id, agent_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )
    
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        verbose=True
    )
    
    return chain

def get_cache_key(user_id: str, agent_id: str, message: str, history_hash: str = ""):
    """Generate a cache key for a chat message"""
    key_components = f"{user_id}:{agent_id}:{message}:{history_hash}"
    return f"chatree:chat:{hashlib.md5(key_components.encode()).hexdigest()}"

def get_history_hash(chat_history: List[ChatMessage]):
    """Generate a hash for chat history to use in cache keys"""
    if not chat_history:
        return ""
    
    # Use last 5 messages at most to keep keys manageable
    recent_history = chat_history[-5:]
    history_str = json.dumps([{"role": msg.role, "content": msg.content} for msg in recent_history])
    return hashlib.md5(history_str.encode()).hexdigest()

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Welcome to Chatree LangChain API"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    # Check Redis connection
    try:
        redis_client.ping()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"error: {str(e)}"
    
    # Check Supabase connection
    try:
        if supabase is not None:
            supabase.table("profiles").select("id").limit(1).execute()
            supabase_status = "connected"
        else:
            supabase_status = "not initialized"
    except Exception as e:
        supabase_status = f"error: {str(e)}"
    
    # Check Ollama connection
    try:
        with httpx.Client() as client:
            response = client.get(f"{ollama_base_url}/api/tags")
            ollama_status = "connected" if response.status_code == 200 else f"error: {response.status_code}"
    except Exception as e:
        ollama_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "services": {
            "redis": redis_status,
            "supabase": supabase_status,
            "ollama": ollama_status
        }
    }

@app.post("/api/agents")
async def create_agent(config: AgentConfig):
    """Create a new agent for a user"""
    try:
        # Create an entry in the agents table
        agent_data = {
            "user_id": config.user_id,
            "id": config.agent_id,
            "name": config.agent_name,
            "vector_store_table": config.vector_store_table
        }
        
        if supabase is not None:
            result = supabase.table("agents").insert(agent_data).execute()
        else:
            raise Exception("Supabase client not initialized")
        
        return {"message": "Agent created successfully", "agent_id": config.agent_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents")
async def add_document(user_id: str, agent_id: str, document: DocumentInput):
    """Add a document to a user's agent knowledge base"""
    try:
        # Add user_id and agent_id to metadata
        document.metadata["user_id"] = user_id
        document.metadata["agent_id"] = agent_id
        
        # Create Document object
        doc = Document(
            page_content=document.content,
            metadata=document.metadata
        )
        
        # Get vector store
        vectorstore = get_vector_store(user_id, agent_id)
        
        # Add document to vector store
        vectorstore.add_documents([doc])
        
        # Invalidate semantic cache for this user's agent
        cache_key_pattern = f"chatree:rag:{user_id}:{agent_id}:*"
        for key in redis_client.scan_iter(match=cache_key_pattern):
            redis_client.delete(key)
        
        return {"message": "Document added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(chat_input: ChatInput):
    """Chat with a user's agent"""
    try:
        # Check cache if enabled
        if chat_input.use_cache:
            history_hash = get_history_hash(chat_input.chat_history) if chat_input.chat_history else ""
            cache_key = get_cache_key(chat_input.user_id, chat_input.agent_id, chat_input.message, history_hash)
            
            # Try to get from cache
            cached_response = redis_client.get(cache_key)
            if cached_response:
                return ChatResponse(response=cached_response, source="cache")
            
            # Try semantic cache
            semantic_result = semantic_cache.lookup(chat_input.message)
            if semantic_result:
                return ChatResponse(response=semantic_result, source="semantic_cache")
        
        # Convert chat history to the format expected by LangChain
        history = []
        if chat_input.chat_history:
            for msg in chat_input.chat_history:
                if msg.role == "user":
                    history.append({"type": "human", "data": {"content": msg.content}})
                else:
                    history.append({"type": "ai", "data": {"content": msg.content}})
        
        # Get retrieval chain
        chain = get_retrieval_chain(chat_input.user_id, chat_input.agent_id)
        
        # Generate response
        response = chain({"question": chat_input.message, "chat_history": history})
        answer = response["answer"]
        
        # Cache the response
        if chat_input.use_cache:
            history_hash = get_history_hash(chat_input.chat_history) if chat_input.chat_history else ""
            cache_key = get_cache_key(chat_input.user_id, chat_input.agent_id, chat_input.message, history_hash)
            redis_client.set(cache_key, answer, ex=86400)  # 24 hours expiration
            
            # Add to semantic cache
            semantic_cache.update(chat_input.message, answer)
        
        # Save to chat history in Supabase
        if supabase is not None:
            chat_history_data = [
                {
                    "user_id": chat_input.user_id,
                    "agent_id": chat_input.agent_id,
                    "session_id": history_hash or "new_session",
                    "role": "user",
                    "content": chat_input.message
                },
                {
                    "user_id": chat_input.user_id,
                    "agent_id": chat_input.agent_id,
                    "session_id": history_hash or "new_session",
                    "role": "assistant",
                    "content": answer
                }
            ]
            
            supabase.table("chat_history").insert(chat_history_data).execute()
        else:
            raise Exception("Supabase client not initialized")
        
        # Return the assistant's response
        return ChatResponse(response=answer, source="llm")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def list_models():
    """List available Ollama models"""
    try:
        # Check cache first
        cache_key = "chatree:models:list"
        cached_models = redis_client.get(cache_key)
        
        if cached_models:
            return json.loads(cached_models)
        
        # If not in cache, fetch from Ollama
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ollama_base_url}/api/tags")
            models = response.json()
            
            # Cache the result for 1 hour
            redis_client.set(cache_key, json.dumps(models), ex=3600)
            
            return models
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/cache")
async def clear_cache(user_id: Optional[str] = None, agent_id: Optional[str] = None):
    """Clear cache data. If user_id and agent_id are provided, only clear that user's agent cache."""
    try:
        if user_id and agent_id:
            # Clear specific user's agent cache
            cache_key_pattern = f"chatree:*:{user_id}:{agent_id}:*"
        elif user_id:
            # Clear all of user's cache
            cache_key_pattern = f"chatree:*:{user_id}:*"
        else:
            # Clear all cache
            cache_key_pattern = "chatree:*"
        
        # Get all keys matching the pattern
        keys = list(redis_client.scan_iter(match=cache_key_pattern))
        
        # Delete all matching keys
        if keys:
            redis_client.delete(*keys)
        
        return {"message": f"Cache cleared successfully. Deleted {len(keys)} entries."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cache/stats")
async def cache_stats():
    """Get cache statistics"""
    try:
        # Get Redis info
        info = redis_client.info()
        
        # Count cache entries by type
        chat_cache_count = len(list(redis_client.scan_iter(match="chatree:chat:*")))
        rag_cache_count = len(list(redis_client.scan_iter(match="chatree:rag:*")))
        models_cache_count = len(list(redis_client.scan_iter(match="chatree:models:*")))
        
        return {
            "total_keys": info.get("db0", {}).get("keys", 0),
            "memory_used": f"{info.get('used_memory_human', '0')}",
            "uptime": f"{info.get('uptime_in_seconds', 0)} seconds",
            "cache_counts": {
                "chat": chat_cache_count,
                "rag": rag_cache_count,
                "models": models_cache_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
