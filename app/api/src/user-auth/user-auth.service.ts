import { prisma } from "../lib/prisma";

export const createUser = async (address: string, username: string) => {
 return  await prisma.user.create({ data: { address, username } });
};

export const findUser = (address: string) => {
  return prisma.user.findUnique({
    where: { address },
  });
};

export const username = () => "User";