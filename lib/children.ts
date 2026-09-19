import { getCurrentFamilyContext } from './auth'
import { prisma } from './db'

export async function listChildrenForCurrentParent() {
  const { family } = await getCurrentFamilyContext()

  return prisma.childProfile.findMany({
    where: { familyId: family.id },
    orderBy: { birthDate: 'desc' },
    select: { id: true, firstName: true, lastName: true, icon: true },
  })
}
