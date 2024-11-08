const express = require('express');
const router = express.Router();

const User = require('../../models/user');
const Friend = require('../../models/friend');
const auth = require('../auth/middleware/auth');

router.get('/suggest-friends', auth, async (req, res) => {
    try {
        const userId = req.user._id; // Lấy ID của người dùng hiện tại

        // Lấy danh sách bạn bè của người dùng
        const friends = await Friend.find({ userId });

        // Lấy danh sách các yêu cầu kết bạn đang chờ
        const pendingRequests = await Friend.find({ userId, status: 'pending' });

        // Tạo danh sách các ID người dùng đã có
        const friendsIds = friends.map(friend => friend.friendId);
        const pendingIds = pendingRequests.map(request => request.userId);

        // Kết hợp tất cả các ID cần loại bỏ
        const allIds = new Set([...friendsIds, ...pendingIds, userId]);

        const suggestedFriends = await User.find({ _id: { $nin: Array.from(allIds) } });


        return res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Danh sách gợi ý bạn bè",
            data: suggestedFriends
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            status: "error",
            message: "Lỗi máy chủ nội bộ"
        });
    }
});


// Lấy danh sách bạn bè đã chấp nhận
router.get('/friends/accepted', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // const friends = await Friend.find({ userId });
        const friends = await Friend.find({ userId, status: 'accepted' })
            .populate({
                path: 'friendId',
                select: '-password'
            });

        return res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Danh sách bạn bè đã chấp nhận",
            data: friends
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            status: "error",
            message: "Lỗi máy chủ nội bộ"
        });
    }
});

// Lấy danh sách yêu cầu kết bạn đang chờ xác nhận
router.get('/friends/pending', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        const friends = await Friend.find({ userId, status: 'pending' })
            .populate({
                path: 'friendId',
                select: '-password'
            });

        return res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Danh sách yêu cầu kết bạn đang chờ xác nhận",
            data: friends
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            status: "error",
            message: "Lỗi máy chủ nội bộ"
        });
    }
});

// Gửi yêu cầu kết bạn
router.post('/add-friend', auth, async (req, res) => {
    try {
        const requesterId = req.user._id; // ID của người gửi yêu cầu
        const receiverId = req.query.userId; // ID của người nhận yêu cầu

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                status: "error",
                message: "Tham số userId không hợp lệ"
            });
        }

        // Kiểm tra xem yêu cầu kết bạn đã tồn tại chưa
        const existingRequest = await Friend.findOne({ userId: requesterId, friendId: receiverId });
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                status: "error",
                message: "Yêu cầu kết bạn đã tồn tại hoặc bạn đã là bạn bè"
            });
        }

        // Tạo mới yêu cầu kết bạn
        const friendRequest = new Friend({ userId: requesterId, friendId: receiverId });
        await friendRequest.save();

        return res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Yêu cầu kết bạn đã được gửi"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            status: "error",
            message: "Lỗi máy chủ nội bộ"
        });
    }
});

// Chấp nhận yêu cầu kết bạn
router.post('/accept-friend', auth, async (req, res) => {

    try {
        const userId = req.user._id; // ID của người dùng hiện tại
        const friendId = req.query.friendId; // ID của người gửi yêu cầu

        if (!friendId) {
            return res.status(400).json({
                success: false,
                status: "error",
                message: "ID của yêu cầu bạn bè không hợp lệ"
            });
        }

        // Tìm yêu cầu kết bạn với trạng thái 'pending'
        const friendRequest = await Friend.findOne({ userId, friendId, status: 'pending' });

        if (!friendRequest) {
            return res.status(400).json({
                success: false,
                status: "error",
                message: "Yêu cầu kết bạn không tồn tại hoặc đã được chấp nhận"
            });
        }

        // Cập nhật trạng thái kết bạn thành 'accepted'
        const update = await Friend.updateOne({ userId, friendId }, { status: 'accepted' });

        if (update.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                status: "error",
                message: "Không thể cập nhật yêu cầu kết bạn"
            });
        }

        return res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Yêu cầu kết bạn đã được chấp nhận"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            status: "error",
            message: "Lỗi máy chủ nội bộ"
        });
    }
});

// Hủy kết bạn, từ chối kết bạn
router.delete('/remove-friend', auth, async (req, res) => {
    try {
        const userId = req.user._id; // ID của người dùng hiện tại
        const friendId = req.query.friendId; // ID của người bạn

        // Xóa mối quan hệ kết bạn
        const result = await Friend.deleteMany({
            $or: [
                { userId: userId, friendId: friendId },
                { userId: friendId, friendId: userId }
            ]
        });

        if (result.deletedCount === 0) {
            return res.status(400).json({
                success: false,
                status: "error",
                message: "Không thể hủy kết bạn hoặc bạn không phải là bạn bè"
            });
        }

        return res.status(200).json({
            success: true,
            status: "SUCCESS",
            message: "Đã hủy kết bạn thành công"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            status: "error",
            message: "Lỗi máy chủ nội bộ"
        });
    }
});


module.exports = router;
