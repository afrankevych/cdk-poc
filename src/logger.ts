export const logger = {
    info: (log: string): void => {
        console.log(log)
    },
    error: (error: string): void => {
        console.error(error)
    }
}