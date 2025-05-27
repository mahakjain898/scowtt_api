import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const email = session.user.email;

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({ where: { email } });
    return res.status(200).json({ movie: user?.favoriteMovie || null });
  }

  if (req.method === "POST") {
    const { movie } = req.body;

    if (!movie || typeof movie !== "string") {
      return res.status(400).json({ error: "Movie name is required" });
    }

    const omdbKey = process.env.OMDB_API_KEY!;
    const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movie)}&apikey=${omdbKey}`);
    const data = await response.json();

    if (data.Response === "False") {
      return res.status(400).json({ error: "Invalid movie name" });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { favoriteMovie: movie },
    });

    return res.status(200).json({ success: true, movie: updatedUser.favoriteMovie });
  }

  res.status(405).end(); 
}
