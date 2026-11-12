import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { successResponse, validationError, errorResponse, unauthorizedError, readJsonBody } from "@/lib/api-response";
import { signToken, setTokenCookie } from "@/lib/auth";
import * as authService from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const bodyResult = await readJsonBody(request);
    if (bodyResult.error) return bodyResult.error;
    const parsed = loginSchema.safeParse(bodyResult.data);

    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    const user = await authService.loginUser(email, password);

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setTokenCookie(token);

    return successResponse(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      return unauthorizedError(error.message);
    }
    console.error("Login error:", error);
    return errorResponse("Internal server error");
  }
}
