export const getRedirectPathByRole = (role: string): string => {
  switch (role) {
    case 'technician':
      return '/technician/request-list';
    case 'clerk':
      return '/clerk/dashboard';
    case 'purchasingStaff':
      return '/PurchasingStaff/purchasing-part';
    default:
      return '/Login';
  }
};