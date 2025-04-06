import dbConnect from '@/lib/mongoose';
import User from '@/user_models/user';

export async function GET(req) {
  await dbConnect();

  const users = await User.find({});
  return new Response(JSON.stringify(users), { status: 200 });
}

export async function POST(req) {
  await dbConnect();

  const body = await req.json();
  const newUser = await User.create(body);

  return new Response(JSON.stringify(newUser), { status: 201 });
}
