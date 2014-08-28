/**
 * Created by Joseph on 8/16/2014.
 */
var toDoListApp = angular.module('ToDoListApp', ['DateFilter', 'TimeFilter', 'SortableHeader', 'CompletedTasks', 'RemainingTasks', 'TaskStatistics', 'TaskCreation' ,'TaskModification']);
toDoListApp.controller('ToDoListController', function ($scope, $timeout) {

    /**
     * FIELDS
     */
    var tasks = [];
    var currentlyEditedTask = null;
    var groupStats = [];
    var REMAINING_VIEW = 'REMAINING';
    var COMPLETED_VIEW = 'COMPLETED';
    var STATISTICS_VIEW = 'STATISTICS';
    var currentView = REMAINING_VIEW;

    var TRACKING_UPDATE_INTERVAL_IN_MS = 30; //[JG] 08/27/2014: 30 seconds is pretty safe since hours are displayed to 2 decimal places.

    $scope.tasks = tasks;
    $scope.groupStats = groupStats;

    $scope.creationInput = {name:null, group:null}; //[JG] 08/27/2014: Used to avoid input resetting on page change.

    /**
     * INITIALIZATION
     */
    initializeBackgroundProcesses();


    function initializeBackgroundProcesses() {
        startTrackingUpdateRepeatingTimer();
        startStatisticsUpdateRepeatingTimer();
    }

    function startTrackingUpdateRepeatingTimer() {
        var trackingUpdateTimer = $timeout(function () {
            updateTimeTrackedForAllTasks();
            startTrackingUpdateRepeatingTimer();
        }, TRACKING_UPDATE_INTERVAL_IN_MS);
    }

    function startStatisticsUpdateRepeatingTimer() {
        var statisticsUpdateTimer = $timeout(function () {
            if ($scope.getCurrentView() === STATISTICS_VIEW) {
                $scope.updateStats();
            }
            startStatisticsUpdateRepeatingTimer();
        }, TRACKING_UPDATE_INTERVAL_IN_MS);
    }


    /**
     * METHODS
     */

    /**
     * Add a task to the list of tasks.
     * @param taskFields
     */
    $scope.addTask = function(taskFields) {
        if (isValidInput(taskFields.name, taskFields.group)) {
            var createdTask = createTask(taskFields.name, taskFields.group);
            tasks.unshift(createdTask);
            resetTaskFields(taskFields);
        }
    };

    function createTask(taskName, taskGroup) {
        var taskToCreate = new Task();
        taskToCreate.name = taskName;
        taskToCreate.group = taskGroup;
        return taskToCreate;
    };

    function isValidInput(taskName, taskGroup) {
        return taskName || taskGroup;
    }

    function resetTaskFields(taskFieldsToReset) {
        taskFieldsToReset.name = null;
        taskFieldsToReset.group = null;
    };


    /**
     * Add a task to the list of tasks.
     * @param taskFields
     */
    $scope.prepareEditTask = function(taskToEdit) {
        currentlyEditedTask = taskToEdit;
        $scope.inputCopy = angular.copy(currentlyEditedTask);
    };

    $scope.editTask = function(taskFields) {
        currentlyEditedTask.name = taskFields.name;
        currentlyEditedTask.group = taskFields.group;
        $scope.inputCopy = null;
        currentlyEditedTask = null;
    };

    /**
     * Marks a task as completed/finished.
     * @param task
     */
    $scope.markComplete = function(task) {
        task.markComplete();
    };

    /**
     * Starts tracking a task.
     * @param task
     */
    $scope.startTrackingTask = function(task) {
        task.startTracking();
    }

    /**
     * Stops tracking a task.
     * @param task
     */
    $scope.stopTrackingTask = function(task) {
        task.stopTracking();
    };

    function updateTimeTrackedForAllTasks() {
        for (var objectIndex = 0; objectIndex < tasks.length; objectIndex++) {
            var task = tasks[objectIndex];
            task.bankTimeTracked();
        }
    }

    /**
     * Updates the statistics.
     */
    $scope.updateStats = function() {
        var uniqueGroups = getUniqueGroupStats();
        var groupStats = [];
        for (index = 0; index < tasks.length; index++) {
            var currentTask = tasks[index];
            currentTask.bankTimeTracked();
            var groupStat = uniqueGroups[currentTask.group];
            groupStat.taskCount++;
            groupStat.totalTimeTracked += currentTask.totalTimeTracked;

            if (currentTask.isCompleted) {
                groupStat.completedCount++;
            }
            else {
                groupStat.remainingCount++;
            }
        }

        for (var group in uniqueGroups) {
            groupStats.push(uniqueGroups[group]);
        }

        $scope.groupStats = groupStats;
    };

    function getUniqueGroupStats() {
        var uniqueGroups = {};
        for (taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            var group = tasks[taskIndex].group;
            if (!uniqueGroups[group]) {
                var groupStat = new GroupStat();
                groupStat.group = group;
                uniqueGroups[group] = groupStat;
            }
        }
        return uniqueGroups;
    }

    /**
     * NAVIGATION
     */

    $scope.getCurrentView = function() {
        return currentView;
    }
    $scope.showStats = function() {
        currentView = STATISTICS_VIEW;
    };

    $scope.showTasksCompleted = function() {
        currentView = COMPLETED_VIEW;
    };

    $scope.showTasksRemaining = function() {
        currentView = REMAINING_VIEW;
    };
});