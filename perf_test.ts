const getRandomPrimitiveColor = () => 'red';

function oldImplementation(generalLogKeys: string[], eventLogs: any[]) {
    return generalLogKeys.map((key) => {
        const index = eventLogs.findIndex((e) => e.key === key);
        return {
            key,
            visible: index !== -1 ? eventLogs[index].visible : false,
            color: eventLogs[index]?.color || getRandomPrimitiveColor(),
            iconName: eventLogs[index]?.iconName || 'CiStreamOn',
            hvqlScript: eventLogs[index]?.hvqlScript,
        };
    });
}

function newImplementation(generalLogKeys: string[], eventLogs: any[]) {
    const eventLogMap = new Map();
    for (const log of eventLogs) {
        eventLogMap.set(log.key, log);
    }

    return generalLogKeys.map((key) => {
        const eventLog = eventLogMap.get(key);
        return {
            key,
            visible: eventLog ? eventLog.visible : false,
            color: eventLog?.color || getRandomPrimitiveColor(),
            iconName: eventLog?.iconName || 'CiStreamOn',
            hvqlScript: eventLog?.hvqlScript,
        };
    });
}

const N = 10000;
const generalLogKeys = Array.from({length: N}, (_, i) => `key_${i}`);
const eventLogs = Array.from({length: N}, (_, i) => ({
    key: `key_${i}`,
    visible: i % 2 === 0,
    color: 'blue',
    iconName: 'test',
    hvqlScript: 'script'
}));

console.time('Old Implementation');
oldImplementation(generalLogKeys, eventLogs);
console.timeEnd('Old Implementation');

console.time('New Implementation');
newImplementation(generalLogKeys, eventLogs);
console.timeEnd('New Implementation');
