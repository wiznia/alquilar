import cron from 'node-cron';
import {
  notifyPastEvents,
  listingPriceHasChanged,
  enableRatingForm,
} from '../helpers.js';

const scheduleJobs = () => {
  cron.schedule('0 0 * * *', notifyPastEvents);
  cron.schedule('0 0 * * *', listingPriceHasChanged);
  cron.schedule('0 0 * * *', enableRatingForm);
};

export default scheduleJobs;
