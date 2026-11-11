import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  await connectDB();

  const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const userObj = user.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
}

export async function loginUser(email: string, password: string) {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const userObj = user.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
}

export async function getUserById(id: string) {
  await connectDB();

  const user = await User.findById(id).select("-password").lean();
  return user;
}
