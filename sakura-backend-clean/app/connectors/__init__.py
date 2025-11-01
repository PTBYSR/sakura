"""
Connector system for integrating external services via MCP protocol.
"""
from .base_connector import BaseConnector, ConnectorStatus, ConnectorType
from .connector_registry import ConnectorRegistry, get_connector_registry, init_connector_registry
from .shopify_connector import ShopifyConnector

__all__ = [
    "BaseConnector",
    "ConnectorStatus",
    "ConnectorType",
    "ConnectorRegistry",
    "get_connector_registry",
    "init_connector_registry",
    "ShopifyConnector",
]
