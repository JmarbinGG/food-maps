"""
DoGoods Agentic AI System
==========================

LangGraph-based agentic architecture for Nouri AI.

The live chat path is backend.ai.ai_engine; it only uses the light modules
here (suggestion_chips, user_guidance, learning). The LangGraph runtime
(graph / planner) needs langgraph + langchain_openai, so it is imported
lazily on first attribute access instead of on every `import backend.agent.*`.

Core components:
- state.py: Conversation state definitions
- graph.py: LangGraph workflow (nodes, edges, conditional routing)
- prompts.py: Minimal system prompts
- planner.py: Multi-step plan generation and execution
- proactive.py: Proactive suggestion engine
- learning.py: User preference tracking
"""

from importlib import import_module

from backend.agent.state import AgentState, ConversationState, Message, PlanStep, ProactiveSuggestion, UserContext

_LAZY = {
    "create_agent_graph": "backend.agent.graph",
    "invoke_agent": "backend.agent.graph",
    "create_plan": "backend.agent.planner",
    "execute_plan_step": "backend.agent.planner",
    "plan_to_text": "backend.agent.planner",
    "get_proactive_suggestions": "backend.agent.proactive",
    "update_user_preferences": "backend.agent.learning",
    "get_user_preferences": "backend.agent.learning",
    "build_system_prompt": "backend.agent.prompts",
    "ERROR_RESPONSES": "backend.agent.prompts",
}


def __getattr__(name):
    module = _LAZY.get(name)
    if module is None:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
    return getattr(import_module(module), name)


__all__ = [
    "AgentState",
    "ConversationState",
    "Message",
    "PlanStep",
    "ProactiveSuggestion",
    "UserContext",
    *_LAZY,
]
