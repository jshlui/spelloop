var GameContext = React.createContext(null);

function GameContextProvider(props) {
  var children = props.children;
  const [correctClicks, setCorrectClicks] = React.useState(0);
  const [totalClicks, setTotalClicks] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [taskHistory, setTaskHistory] = React.useState([]);
  const [distractorCount, setDistractorCount] = React.useState(5);
  const [tasksCompleted, setTasksCompleted] = React.useState(0);

  var accuracy = totalClicks === 0 ? 1 : correctClicks / totalClicks;

  var recordClick = React.useCallback(function(correct, mode, ms) {
    setTotalClicks(function(t) { return t + 1; });
    if (correct) {
      setCorrectClicks(function(c) { return c + 1; });
      setStreak(function(s) { return s + 1; });
      setTaskHistory(function(h) { return h.concat([{ mode: mode, correct: true, ms: ms }]); });
    } else {
      setStreak(0);
      setTaskHistory(function(h) { return h.concat([{ mode: mode, correct: false, ms: ms }]); });
    }
  }, []);

  var recordTaskComplete = React.useCallback(function(mode, ms) {
    setTasksCompleted(function(prev) {
      var next = prev + 1;
      if (next % 3 === 0) {
        setDistractorCount(function(d) {
          if (accuracy >= 0.85) return Math.min(d + 1, 9);
          if (accuracy <= 0.45) return Math.max(d - 1, 2);
          return d;
        });
      }
      return next;
    });
    setTaskHistory(function(h) { return h.concat([{ mode: mode, correct: true, ms: ms, type: 'complete' }]); });
  }, [accuracy]);

  var value = {
    correctClicks: correctClicks,
    totalClicks: totalClicks,
    streak: streak,
    taskHistory: taskHistory,
    distractorCount: distractorCount,
    tasksCompleted: tasksCompleted,
    accuracy: accuracy,
    recordClick: recordClick,
    recordTaskComplete: recordTaskComplete
  };

  return React.createElement(GameContext.Provider, { value: value }, children);
}

Object.assign(window, { GameContext: GameContext, GameContextProvider: GameContextProvider });
