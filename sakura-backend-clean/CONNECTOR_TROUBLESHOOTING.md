# Connector Troubleshooting Guide

## Shopify Connector Status

✅ **Connector is working!** The test script shows:
- Connection to Shopify MCP server: ✅
- Tool listing (9 tools found): ✅
- Tool execution: ✅
- Registry integration: ✅

## Common Issues & Solutions

### 1. Connector Not Showing Tools in AI Responses

**Symptom:** You created a connector, but the AI doesn't use Shopify tools.

**Check:**
```bash
# Check if connector is registered and connected
curl http://localhost:8000/api/connectors

# Check available tools
curl http://localhost:8000/api/connectors/{connector_id}/tools
```

**Solution:** Ensure:
1. Connector status is `"connected"` (not `"disconnected"` or `"error"`)
2. Tools are listed when calling the tools endpoint
3. Restart the backend or manually refresh tools after adding connector

### 2. Tools Not Being Loaded into LangGraph

**Symptom:** Tools exist but AI doesn't call them.

**Debug:**
Look for these log messages when starting the backend:
```
🔄 Refreshing connector tools...
✅ Loaded X connector tools
```

If you see "Loaded 0 connector tools" even after adding a connector:
- Make sure connector status is `connected`
- Check that tools endpoint returns tools
- Manually refresh: Tools refresh when connector connects

### 3. Tool Execution Fails

**Symptom:** AI tries to call tools but gets errors.

**Check logs for:**
```
❌ Error calling tool 'tool_name': ...
```

**Common causes:**
- MCP server is down or unreachable
- Tool arguments don't match expected format
- Network/firewall issues

### 4. Connector Status Shows "error"

**Check:**
```bash
curl http://localhost:8000/api/connectors/{connector_id}
```

Look at `last_error` field for details.

**Common errors:**
- `server_url is required` - Config missing
- `Connection timeout` - Server unreachable
- `Health check failed` - Server not responding
- `HTTP error: 404` - Wrong URL

### 5. Tools Not Being Called by AI

**The AI might not recognize when to use tools. Try:**

1. **More specific queries:**
   - ❌ "What do you have?"
   - ✅ "What products are available in your Shopify store?"
   - ✅ "Show me your products"
   - ✅ "Get me a list of your Shopify products"

2. **Check tool descriptions:** Tools need good descriptions for AI to know when to use them. The Shopify server provides:
   - `get-products`: "Shopify get-products tool"
   - `get-product-by-id`: "Shopify get-product-by-id tool"
   - etc.

3. **Verify tools are registered:**
   Look for: `✅ Loaded X connector tools` in startup logs

## Manual Testing

### Test Connector Connection
```bash
# Create connector
curl -X POST http://localhost:8000/api/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "connector_type": "shopify",
    "name": "Shopify Store",
    "config": {
      "server_url": "https://shopify-mcp-gldh.onrender.com"
    }
  }'
```

### Test Tool Call Directly
```bash
# Get connector ID from listProm實在

# Call a tool directly
curl -X POST http://localhost:8000/api/connectors/{connector_id}/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "connector_id": "{connector_id}",
    "tool_name": "get-products",
    "arguments": {}
  }'
```

### Test Chat with Tool Usage
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What products do you have in your Shopify store?",
    "session_id": "test-123"
  }'
```

## Debug Checklist

- [ ] Connector is created and status is "connected"
- [ ] Tools are listed when calling `/api/connectors/{id}/tools`
- [ ] Backend logs show "Loaded X connector tools" (where X > 0)
- [ ] Tool direct call works via `/api/connectors/{id}/tools/call`
- [ ] Chat query is specific about using Shopify/Store/Products
- [ ] Backend logs show tool calls being attempted
- [ ] No errors in backend logs

## Getting More Information

### Check Backend Logs
Look for:
- `🔄 Refreshing connector tools...` - Tool refresh happening
- `✅ Loaded X connector tools` - Tools successfully loaded
- `🤖 Processing message...` - AI processing
- Tool call attempts in logs

### Enable Debug Mode
In `app/core/settings.py`, set:
```python
debug: bool = True
```

## Known Limitations

1. **Tools without inputSchema:** Shopify MCP server doesn't provide input schemas, but this is handled automatically.

2. **Static connectors:** Connectors are in-memory only and will be lost on restart. Re-add them via API.

3. **Tool refresh:** Tools are refreshed when:
   - Connector is created/connected
   - Connector is manually reconnected
   - Backend starts (if connectors were previously connected)

## Still Having Issues?

1. Check the connector test output:
   ```bash
   # The test shows everything working, so the issue is likely integration
   ```

2. Verify the MCP server is accessible:
   ```bash
   curl https://shopify-mcp-gldh.onrender.com/health
   ```

3. Check backend logs for specific error messages

4. Try creating the connector again via API

5. Restart the backend after adding connectors
