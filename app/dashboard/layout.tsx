import DashboardShell from '@/components/Layout/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
