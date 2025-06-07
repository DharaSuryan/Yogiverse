import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
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
    width: 75,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    backgroundColor: '#fff',
  },
  activeStoryRing: {
    borderWidth: 2,
    borderColor: '#FF8501',
  },
  storyImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  addStoryButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  addButtonBackground: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  storyUsername: {
    marginTop: 4,
    fontSize: 12,
    color: '#262626',
    textAlign: 'center',
    width: '100%',
  },
  yourStoryUsername: {
    color: '#999',
  },
  
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: '600',
    fontSize: 14,
  },
  postImage: {
    width: '100%',
    height: width,
  },
 
  postLeftActions: {
    flexDirection: 'row',
    gap: 15,
  },
  postStats: {
    padding: 10,
  },
  likesCount: {
    fontWeight: '600',
    marginBottom: 5,
  },
  caption: {
    flexDirection: 'row',
  },
  captionUsername: {
    fontWeight: '600',
    marginRight: 5,
  },
 
  input: {
    flex: 1,
    marginRight: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
  },
  postButton: {
    color: '#0095F6',
    fontWeight: '600',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  feed: {
    paddingBottom: 20,
  },
  postContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 15,
  },
  modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: '#fff',
    },
    
    modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
},
commentModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 15,
    maxHeight: '85%',
},
modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
},
modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
},

avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
},
avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
},

commentMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
},
metaText: {
    fontSize: 12,
    color: 'gray',
},
emojiRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 5,
},
emoji: {
    fontSize: 22,
},
inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
},


 buttonText: {
        color: '#007AFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
  
    addStoryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
     modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        margin: 20,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    commentUser : {
        fontWeight: 'bold',
        marginRight: 5,
    },
    commentText: {
        flex: 1,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        padding: 10,
        marginBottom: 10,
    },
    submitButton: {
        color: '#0095F6',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    replyingTo: {
        color: '#8e8e8e',
        fontSize: 13,
    },
    mentionText: {
        color: '#0095F6',
        fontWeight: '600',
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
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    commentUsername: {
        fontWeight: '600',
        fontSize: 13,
    },
    commentTime: {
        fontSize: 12,
        color: '#8e8e8e',
    },
    commentActions: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 16,
    },
    commentAction: {
        marginRight: 16,
    },
    commentActionText: {
        fontSize: 12,
        color: '#8e8e8e',
    },
    commentActionTextActive: {
        color: '#FF3B30',
    },
    commentLikeButton: {
        padding: 8,
        marginLeft: 8,
    },
    replyingToContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#fafafa',
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
    },
    replyingToText: {
        color: '#8e8e8e',
        fontSize: 13,
    },
    mentionsList: {
        maxHeight: 200,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
    },
    mentionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    mentionAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    mentionUsername: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    commentsList: {
        flex: 1,
    },
});
