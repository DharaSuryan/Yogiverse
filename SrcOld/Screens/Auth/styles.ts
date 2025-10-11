import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 10;
const GRID_PADDING = 10;
const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginLeft: 10,
    color: '#333',
  },
  disabledButton: {
    opacity: 0.5,
  },
  defaultImage: {
    width: '100%' as const,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  form: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    backgroundColor: '#fafafa',
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    backgroundColor: '#fafafa',
  },
  categoryCard: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    margin: ITEM_MARGIN,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5 as const,
  },
  selectedCard: {
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 10,
  },
  categoryIcon: {
    width: '80%' as const,
    height: '80%' as const,
    resizeMode: 'contain' as const,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  gridContainer: {
    flex: 1,
    padding: GRID_PADDING,
  },
  loadMoreButton: {
    padding: 8,
    alignItems: 'center' as const,
    marginTop: -6,
    marginBottom: 16,
  },
  error: {
    color: '#ed4956',
    marginBottom: 4,
    fontSize: 12,
  },
  phoneContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fafafa',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  countryCodeContainer: {
    width: 80,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    marginRight: 10,
  },
  countryCode: {
    fontSize: 16,
    color: '#666',
  },
  countryItemContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
  },
  countryName: {
    fontSize: 16,
    flex: 1,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#666',
    minWidth: 50,
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  continueButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#bea063',
    margin: 15,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  passwordField: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    backgroundColor: '#fafafa',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%' as const,
    maxHeight: '80%' as const,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});
