// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_fine_wolfpack.sql';
import m0001 from './0001_awesome_captain_stacy.sql';
import m0002 from './0002_colossal_gunslinger.sql';
import m0003 from './0003_warm_kid_colt.sql';
import m0004 from './0004_fixed_catseye.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004
    }
  }
  