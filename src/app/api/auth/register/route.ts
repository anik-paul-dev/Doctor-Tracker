import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { successResponse, validationError, errorResponse, conflictError } from "@/lib/api-response";
import { signToken } from "@/lib/auth";
import * as authService from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.flatten().fieldErrors);
    }

    const { name, email, password } = parsed.data;

    const user = await authService.registerUser(name, email, password);

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await (await import("@/lib/auth")).setTokenCookie(token);

    return successResponse(user, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return conflictError(error.message);
    }
    console.error("Register error:", error);
    return errorResponse("Internal server error");
  }
}
