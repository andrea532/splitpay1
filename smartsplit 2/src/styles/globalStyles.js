import { StyleSheet, Platform } from 'react-native';

export const colors = {
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  secondary: '#4CAF50',
  secondaryDark: '#388E3C',
  accent: '#FF9800',
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
  info: '#2196F3',
  
  // Grays
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  gray: '#9E9E9E',
  darkGray: '#424242',
  black: '#000000',
  
  // Text
  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#BDBDBD',
  
  // Backgrounds
  background: '#FAFAFA',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  circle: 999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
};

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  
  // Header
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.md : spacing.md,
    ...shadows.medium,
  },
  headerTitle: {
    color: colors.white,
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  
  // Buttons
  addButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.circle,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addExpenseButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.circle,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createFirstGroupButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  createFirstGroupButtonText: {
    color: colors.white,
    ...typography.button,
    textAlign: 'center',
  },
  
  // Cards
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  expenseCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.small,
  },
  settlementCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  
  // Group Info
  groupInfo: {
    flex: 1,
  },
  groupName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  groupDetails: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  groupAmount: {
    ...typography.body2,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  
  // Balance Info
  balanceInfo: {
    flex: 1,
  },
  balanceName: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  balanceDetails: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  balanceAmount: {
    ...typography.h4,
    fontWeight: 'bold',
  },
  
  // Settlement
  settlementText: {
    ...typography.body1,
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 22,
  },
  settlementFrom: {
    fontWeight: 'bold',
  },
  settlementTo: {
    fontWeight: 'bold',
  },
  settlementAmount: {
    fontWeight: 'bold',
    color: colors.error,
  },
  
  // Stats
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  // Expense Details
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  expenseDescription: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  expenseAmount: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  expenseInfo: {
    marginBottom: spacing.sm,
  },
  expensePaidBy: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  expensePaidByName: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  expenseLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  expenseLocation: {
    ...typography.body2,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  expenseDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  expenseDate: {
    ...typography.caption,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  expenseDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: spacing.sm,
  },
  expenseDetailsTitle: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  memberExpense: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  
  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  
  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyExpenses: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyMembers: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubText: {
    ...typography.body1,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  
  // Help
  helpSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  helpText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
    ...shadows.large,
  },
  modalHeader: {
    backgroundColor: colors.lightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  modalCancel: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  modalSave: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: spacing.md,
  },
  
  // Form Elements
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  inputLabel: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  
  // Members
  addMemberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addMemberButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  addMemberButtonText: {
    color: colors.white,
    ...typography.button,
  },
  memberItem: {
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    ...typography.body1,
    color: colors.textPrimary,
    flex: 1,
  },
  removeMemberButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.circle,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Member Expense Inputs
  memberExpenseInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
  },
  memberLabel: {
    flex: 1,
    ...typography.body1,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  amountInput: {
    width: 80,
    textAlign: 'right',
    ...typography.body1,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
  },
  currencyLabel: {
    ...typography.body1,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  
  // Picker
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray,
    marginBottom: spacing.md,
  },
  picker: {
    height: 50,
  },
  pickerLabel: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  
  // Total Section
  totalSection: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.h4,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  
  // Action Buttons
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  actionButtonText: {
    color: colors.white,
    ...typography.button,
  },
});