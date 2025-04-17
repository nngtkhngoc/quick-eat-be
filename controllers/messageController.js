import { getAssistantResponse } from "../config/openai.js";

const handleUserInput = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ success: false, message: "Message is required" });
  } else {
    return res
      .status(200)
      .json({ success: true, message: await getAssistantResponse(message) });
  }
};
export { handleUserInput };
