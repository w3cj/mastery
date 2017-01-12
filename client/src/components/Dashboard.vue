<template>
  <div>
    <instructor-dashboard v-if="user.isInstructor"></instructor-dashboard>
    <student-dashboard v-if="!user.isInstructor"></student-dashboard>
  </div>
</template>

<script>
import Auth from '../lib/Auth';
import InstructorDashboard from './instructor/InstructorDashboard';
import StudentDashboard from './student/StudentDashboard';

export default {
  name: 'dashboard',
  components: {
    'instructor-dashboard': InstructorDashboard,
    'student-dashboard': StudentDashboard,
  },
  data() {
    return {
      user: Auth.getCurrentUser()
    };
  }
}
</script>
