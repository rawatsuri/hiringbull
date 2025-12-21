import httpStatus from 'http-status';
import prisma from '../prismaClient.js';
import { getClerkUserId } from '../middlewares/auth.js';

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export const getCurrentUser = catchAsync(async (req, res) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) {
    const error = new Error('User not authenticated');
    error.statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    include: { devices: true, followedCompanies: true }
  });

  if (!user) {
    const error = new Error('User record not found in database');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  res.status(httpStatus.OK).json(user);
});

export const createUser = catchAsync(async (req, res) => {
  const clerkId = getClerkUserId(req);
  if (!clerkId) {
    const error = new Error('User not authenticated via Clerk');
    error.statusCode = httpStatus.UNAUTHORIZED;
    throw error;
  }

  const { email, name, img_url } = req.body;

  // Use Upsert to either create or update, ensuring we don't have duplicates
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {
      name: name || undefined,
      img_url: img_url || undefined,
      // We don't update email here as it's the unique identifier from Clerk
    },
    create: {
      clerkId,
      email,
      name: name || 'User',
      img_url,
    },
  });

  res.status(httpStatus.CREATED).json(user);
});

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(httpStatus.OK).json(users);
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  res.status(httpStatus.OK).json(user);
});

export const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateBody = req.body;
  const clerkUserId = getClerkUserId(req);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  // Security check: Only allow users to update themselves
  if (user.clerkId !== clerkUserId) {
    const error = new Error('Unauthorized to update this user');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  if (updateBody.email && (await prisma.user.findUnique({ where: { email: updateBody.email } }))) {
    if (updateBody.email !== user.email) {
      const error = new Error('Email already taken');
      error.statusCode = httpStatus.BAD_REQUEST;
      throw error;
    }
  }

  // Handle companies relation if present
  let data = { ...updateBody };
  if (updateBody.companies) {
    delete data.companies;
    data.followedCompanies = {
      set: updateBody.companies.map((companyId) => ({ id: companyId }))
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: data,
    include: { followedCompanies: true }
  });
  res.status(httpStatus.OK).json(updatedUser);
});

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const clerkUserId = getClerkUserId(req);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  // Security check: Only allow users to delete themselves
  if (user.clerkId !== clerkUserId) {
    const error = new Error('Unauthorized to delete this user');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  await prisma.user.delete({
    where: { id },
  });
  res.status(httpStatus.NO_CONTENT).send();
});
