# actions.py

def verify_customer_identity(state):
    """
    Mock: verify customer identity based on booking reference.
    In a real implementation, this would check your database or API.
    """
    booking_ref = state.get("booking_reference")
    if booking_ref and len(booking_ref) >= 6:
        state["verified"] = True
        state["booking_status"] = "confirmed"
    else:
        state["verified"] = False
        state["booking_status"] = "unknown"
    return state


def fetch_fare_rules(state):
    """Mock: Fetch fare rules for reschedule flow"""
    state["fare_rules_checked"] = True
    state["change_fee"] = 50
    return state


def present_flight_options(state):
    """Mock: Show available reschedule options"""
    state["available_options"] = ["Option A", "Option B"]
    return state


def fetch_cancellation_policy(state):
    """Mock: Fetch cancellation policy for cancel flow"""
    state["cancellation_allowed"] = True
    return state


def initiate_refund(state):
    """Mock: Process refund"""
    state["refund_processed"] = True
    return state


def update_flight_itinerary(state):
    """Mock: Update booking"""
    state["booking_updated"] = True
    return state


def send_customer_confirmation(state):
    """Mock: Send confirmation message"""
    state["confirmation_sent"] = True
    return state


# Central registry for all action handlers
ACTION_HANDLERS = {
    "verify_customer_identity": verify_customer_identity,
    "fetch_fare_rules": fetch_fare_rules,
    "present_flight_options": present_flight_options,
    "fetch_cancellation_policy": fetch_cancellation_policy,
    "initiate_refund": initiate_refund,
    "update_flight_itinerary": update_flight_itinerary,
    "send_customer_confirmation": send_customer_confirmation,
}
