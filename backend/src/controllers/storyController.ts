import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Story from '../models/Story';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcyberjwttoken123!';

/**
 * Resolves user identity from Auth token or request body to populate author information
 */
const resolveUserIdentity = async (req: Request): Promise<{ userId: string | null; userName: string }> => {
  const token = req.headers.authorization?.split(' ')[1];
  let userId = req.body.userId || null;
  let userName = 'Anonymous Citizen';

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id);
      if (user) {
        userId = user._id.toString();
        userName = user.name;
      }
    } catch (err) {
      console.warn('[AUTH] Failed to decode token during story operation:', err);
    }
  } else if (userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        userName = user.name;
      }
    } catch (err) {
      console.warn('[DATABASE] Failed to find user by body userId:', err);
    }
  }

  return { userId, userName };
};

/**
 * Fetches all stories with optional search, scamType filters, and sorting.
 */
export const getStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scamType, search, sortBy } = req.query;

    const filterQuery: any = {};

    if (scamType && scamType !== 'All') {
      filterQuery.scamType = scamType;
    }

    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption: any = { createdAt: -1 }; // Default: Newest first

    if (sortBy === 'likes') {
      sortOption = { likes: -1, createdAt: -1 };
    } else if (sortBy === 'financialLoss') {
      sortOption = { financialLoss: -1, createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const stories = await Story.find(filterQuery).sort(sortOption);
    res.status(200).json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to retrieve fraud stories.' });
  }
};

/**
 * Creates a new fraud story.
 */
export const createStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, scamType, financialLoss, isAnonymous, customAuthorName } = req.body;

    if (!title || !description || !scamType) {
      res.status(400).json({ error: 'Title, description, and scamType are required.' });
      return;
    }

    const { userId, userName } = await resolveUserIdentity(req);

    // Determine final author name
    let finalAuthorName = 'Anonymous Citizen';
    if (!isAnonymous) {
      finalAuthorName = customAuthorName || userName || 'Anonymous Citizen';
    } else if (customAuthorName) {
      finalAuthorName = customAuthorName;
    }

    const newStory = new Story({
      userId: userId || undefined,
      title,
      description,
      scamType,
      financialLoss: Number(financialLoss) || 0,
      authorName: finalAuthorName,
      isAnonymous: !!isAnonymous,
      likes: 0,
      likedBy: [],
      comments: []
    });

    await newStory.save();
    res.status(201).json({ message: 'Story shared successfully.', story: newStory });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to share fraud story.' });
  }
};

/**
 * Handles liking/unliking a story (toggles state based on voter's identity/IP).
 */
export const likeStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = await resolveUserIdentity(req);
    const voterKey = userId || req.ip || 'anonymous_voter';

    const story = await Story.findById(id);
    if (!story) {
      res.status(404).json({ error: 'Story not found.' });
      return;
    }

    const hasLiked = story.likedBy.includes(voterKey);

    if (hasLiked) {
      // Toggle off / Unlike
      story.likedBy = story.likedBy.filter(key => key !== voterKey);
      story.likes = Math.max(0, story.likes - 1);
    } else {
      // Toggle on / Like
      story.likedBy.push(voterKey);
      story.likes += 1;
    }

    await story.save();
    res.status(200).json({ 
      likes: story.likes, 
      hasLiked: !hasLiked,
      message: hasLiked ? 'Story unliked.' : 'Story liked successfully.' 
    });
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ error: 'Failed to upvote story.' });
  }
};

/**
 * Adds a comment to a story.
 */
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { commentText, customAuthorName } = req.body;

    if (!commentText || !commentText.trim()) {
      res.status(400).json({ error: 'Comment text cannot be empty.' });
      return;
    }

    const { userName } = await resolveUserIdentity(req);
    const authorName = customAuthorName || userName || 'Anonymous Citizen';

    const story = await Story.findById(id);
    if (!story) {
      res.status(404).json({ error: 'Story not found.' });
      return;
    }

    const newComment = {
      authorName,
      commentText,
      createdAt: new Date()
    };

    story.comments.push(newComment);
    await story.save();

    res.status(201).json({ 
      message: 'Comment added successfully.', 
      comments: story.comments 
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
};
