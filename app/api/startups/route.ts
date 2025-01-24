import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"

export async function GET(request: Request) {
  try {
    const jsonDirectory = path.join(process.cwd(), "data")
    const fileContents = await fs.readFile(jsonDirectory + "/data.json", "utf8")
    const data = JSON.parse(fileContents)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

