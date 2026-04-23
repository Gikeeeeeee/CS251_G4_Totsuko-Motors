export const getRedirectPathByRole = (role: string): string => {
  switch (role) {
    case 'technician':
      return '/technician';
    case 'clerk':
      return '/clerk';
    case 'purchasingStaff':
      return '/purchasing';
    default:
      return '/login';
  }
};