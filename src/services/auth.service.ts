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

export interface SafeUser {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function updateUserProfile(
  id: string,
  data: { name?: string; email?: string }
): Promise<SafeUser> {
  await connectDB();

  if (data.email) {
    const existing = await User.findOne({
      email: data.email.toLowerCase(),
      _id: { $ne: id },
    }).lean();
    if (existing) {
      throw new Error("Email is already in use by another account");
    }
  }

  const updateFields: Record<string, string> = {};
  if (data.name?.trim()) updateFields.name = data.name.trim();
  if (data.email?.trim()) updateFields.email = data.email.toLowerCase().trim();

  const user = (await User.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .select("-password")
    .lean()) as SafeUser | null;

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function changeUserPassword(
  id: string,
  currentPass: string,
  newPass: string
) {
  await connectDB();

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPass, user.password);
  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  if (newPass.length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  user.password = await bcrypt.hash(newPass, 12);
  await user.save();

  return true;
}
