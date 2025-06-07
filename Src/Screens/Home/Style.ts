import { StyleSheet } from 'react-native';

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    storyContainer: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    storyItem: {
        alignItems: 'center',
        marginRight: 15,
    },
    storyRing: {
        width: 68,
        height: 68,
        borderRadius: 34,
        padding: 2,
        backgroundColor: '#fff',
    },
    activeStoryRing: {
        backgroundColor: '#FF8501',
    },
    storyImageContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
        position: 'relative',
    },
    storyImage: {
        width: '100%',
        height: '100%',
    },
    storyUsername: {
        marginTop: 5,
        fontSize: 12,
        color: '#262626',
    },
    yourStoryUsername: {
        color: '#999',
    },
    addStoryButton: {
        position: 'absolute',
        bottom: -2,
        right: -2,
    },
    addButtonBackground: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 2,
    },
    carouselContainer: {
        width: '100%',
        position: 'relative',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D1D1',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#0095F6',
        width: 8,
        height: 8,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    commentModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        minHeight: '50%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    commentsList: {
        flex: 1,
    },
    commentItem: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'flex-start',
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUsername: {
        fontWeight: '600',
        marginRight: 8,
    },
    commentTime: {
        color: '#8e8e8e',
        fontSize: 12,
    },
    commentText: {
        color: '#262626',
        marginBottom: 4,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    commentAction: {
        marginRight: 16,
    },
    commentActionText: {
        color: '#8e8e8e',
        fontSize: 12,
    },
    commentActionTextActive: {
        color: '#0095F6',
    },
    commentLikeButton: {
        padding: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 0.5,
        borderTopColor: '#DBDBDB',
    },
    avatarSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 12,
    },
    inputWrapper: {
        flex: 1,
        marginRight: 12,
    },
    commentInput: {
        fontSize: 14,
        color: '#262626',
        maxHeight: 80,
    },
    postButton: {
        color: '#0095F6',
        fontWeight: '600',
    },
    mentionsList: {
        maxHeight: 200,
        borderTopWidth: 0.5,
        borderTopColor: '#DBDBDB',
    },
    mentionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    mentionAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 12,
    },
    mentionUsername: {
        fontSize: 14,
        color: '#262626',
    },
    replyingToContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#F8F8F8',
    },
    replyingToText: {
        color: '#8e8e8e',
        fontSize: 12,
    },
    replyingTo: {
        color: '#0095F6',
        fontWeight: '600',
    },
    mentionText: {
        color: '#0095F6',
    },
});

export default Styles; 