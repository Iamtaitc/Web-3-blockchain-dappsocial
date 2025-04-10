export type User = {
  id: string;
  avatar: string;
  username: string;
  email: string;
  walletAddress: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
};

export type FilterProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}; 