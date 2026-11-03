import { UsersRound } from 'lucide-react';

interface AppBrandIconProps {
  className?: string;
}

export default function AppBrandIcon({ className }: AppBrandIconProps) {
  return <UsersRound aria-hidden="true" className={className} />;
}
