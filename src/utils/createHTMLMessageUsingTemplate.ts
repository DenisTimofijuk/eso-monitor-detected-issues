const EVENT_COLORS = {
    INFO: "#2196F3",
    SUCCESS: "#4CAF50",
    WARNING: "#FF9800",
    ERROR: "#F44336",
    CRITICAL: "#9C27B0",
};

function getEventColor(eventType: keyof typeof EVENT_COLORS) {
    return EVENT_COLORS[eventType] || EVENT_COLORS["INFO"];
}

export function createHTMLMessageUsingTemplate(
    subject: string,
    text: string,
    eventType: keyof typeof EVENT_COLORS = "INFO"
) {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${getEventColor(
              eventType
          )}; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">${subject}</h2>
          </div>
          <div style="border: 1px solid #e0e0e0; padding: 20px; border-radius: 0 0 5px 5px;">
            <p>${text}</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <small style="color: #666;">
              Time: ${new Date().toLocaleString()}
            </small>
          </div>
        </div>
      `;
}
