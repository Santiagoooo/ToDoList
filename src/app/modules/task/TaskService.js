/**
 * Created by Joseph on 8/16/2014.
 */
(function() {
    function TaskService($timeout) {
        var taskList = [];
        var TRACKING_UPDATE_INTERVAL_IN_MS = 30000;
        startTrackingUpdateRepeatingTimer();


        function startTrackingUpdateRepeatingTimer() {
            var trackingUpdateTimer = $timeout(function () {
                updateTimeTrackedForAllTasks();
                startTrackingUpdateRepeatingTimer();
            }, TRACKING_UPDATE_INTERVAL_IN_MS);
        }

        function updateTimeTrackedForAllTasks() {
            for (var objectIndex = 0; objectIndex < taskList.length; objectIndex++) {
                var task = taskList[objectIndex];
                task.bankTimeTracked();
            }
        }


        this.createTask = function (task) {
            if (isValidInput(task.name, task.group)) {
                var createdTask = createTask(task.name, task.group);
                taskList.unshift(createdTask);
            }
        };

        function isValidInput(taskName, taskGroup) {
            return taskName || taskGroup;
        }

        function createTask(taskName, taskGroup) {
            var taskToCreate = new Task();
            taskToCreate.name = taskName;
            taskToCreate.group = taskGroup;
            return taskToCreate;
        }


        this.getTasks = function () {
            return taskList;
        };


        this.markComplete = function (task) {
            task.markComplete();
        };

        this.markTaskIncomplete = function (task) {
            task.markIncomplete();
        };


        this.requestUpdateTimeTrackedForAllTasks = function () {
            updateTimeTrackedForAllTasks();
        };

        this.startTrackingTask = function (task) {
            task.startTracking();
        };

        this.stopTrackingTask = function (task) {
            task.stopTracking();
        };
    }
    angular
        .module('ToDoList.TaskModule')
        .service('TaskService', ['$timeout', TaskService]);
})();