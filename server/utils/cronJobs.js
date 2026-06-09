const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { createNotification } = require('../controllers/notificationController');

const startCronJobs = (io) => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      const upcomingReminders = await Reminder.find({ isCompleted: false }).populate('lead', 'name');

      for (const reminder of upcomingReminders) {
        // Parse reminderDate and reminderTime
        // reminderDate is Date, reminderTime is string "HH:MM"
        const rDate = new Date(reminder.reminderDate);
        const [hours, minutes] = reminder.reminderTime.split(':');
        rDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        const diffMs = rDate.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);

        // 1 Day Before
        if (diffMinutes > 0 && diffMinutes <= 1440 && !reminder.notifiedOneDay) {
          await createNotification({
            title: 'Reminder Tomorrow',
            message: `Reminder "${reminder.title}" for lead ${reminder.lead.name} is tomorrow at ${reminder.reminderTime}.`,
            type: 'alert',
            link: `/crm/leads/${reminder.lead._id}`,
            user: reminder.assignedUser,
          });
          reminder.notifiedOneDay = true;
          await reminder.save();
          if (io) io.emit('new_notification');
        }

        // 1 Hour Before
        if (diffMinutes > 0 && diffMinutes <= 60 && !reminder.notifiedOneHour) {
          await createNotification({
            title: 'Reminder in 1 Hour',
            message: `Reminder "${reminder.title}" for lead ${reminder.lead.name} is coming up.`,
            type: 'alert',
            link: `/crm/leads/${reminder.lead._id}`,
            user: reminder.assignedUser,
          });
          reminder.notifiedOneHour = true;
          await reminder.save();
          if (io) io.emit('new_notification');
        }

        // At Reminder Time (within a 1 minute window)
        if (diffMinutes <= 0 && diffMinutes >= -1 && !reminder.notifiedAtTime) {
          await createNotification({
            title: 'Reminder Now',
            message: `Reminder "${reminder.title}" for lead ${reminder.lead.name} is happening now!`,
            type: 'alert',
            link: `/crm/leads/${reminder.lead._id}`,
            user: reminder.assignedUser,
          });
          reminder.notifiedAtTime = true;
          await reminder.save();
          if (io) io.emit('new_notification');
        }
      }
    } catch (error) {
      console.error('Error running reminder cron job:', error.message);
    }
  });
};

module.exports = startCronJobs;
