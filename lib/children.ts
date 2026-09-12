import { getCurrentParent } from './auth'
import { prisma } from './db'

export async function listChildrenForCurrentParent() {
  const parent = await getCurrentParent()

  return prisma.childProfile.findMany({
    where: { parentId: parent.id },
    orderBy: { birthDate: 'desc' },
    select: { id: true, firstName: true, lastName: true, icon: true },
  })
}
