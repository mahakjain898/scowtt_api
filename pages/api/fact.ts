import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { movie } = req.body;

  console.log("Incoming movie:", movie);

  if (!movie || typeof movie !== "string") {
    return res.status(400).json({ error: "Movie name required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful movie trivia assistant." },
        { role: "user", content: `Tell me a fun fact about the movie "${movie}".` }
      ],
    });

    const fact = completion.choices[0].message.content?.trim();
    res.status(200).json({ fact });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to generate fact" });
  }
}
