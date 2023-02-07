export interface Logger {
    info(log: string): void;

    error(log: string): void;
}

export const logger = {
    info: (log: string): void => {
        console.log(log)
    },
    error: (error: string): void => {
        console.error(error)
    }
} satisfies Logger;
