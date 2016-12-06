/**
 * @link https://github.com/vsivsi/meteor-job-collection
 * @example
 * import { Restivus } from 'meteor/vsivsi:job-collection';
 */
declare module 'meteor/vsivsi:job-collection' {
  import { Mongo } from 'meteor/mongo';
  export interface ProcessOptions {
    concurrency?: number;
    payload?: number;
    pollInterval?: number;
    prefetch?: number;
    workTimeout?: number;
    callbackStrict?: boolean;
  }

  interface JobCollectionOption {
    connection?: Object;
    idGeneration?: string;
    transform?: Function;
    noCollectionSuffix?: boolean;
  }

  interface JobOptions {
    getLog?: boolean;
  }

  interface ResultCallback {
    (error: any, result: any): void;
  }

  interface WorkerCallback<T> {
    (job: Job<T> | Job<T>[], callback: () => void): void;
  }

  interface ResultJobsCallback<T> {
    (error: any, jobs: Job<T>[]): void;
  }

  export type JobStatusType = 'waiting'|'paused'|'ready'|'running'| 'failed'|'cancelled'|'completed';
  export type JobRetryBackoffMethods = 'constant'|'exponential';
  export type JobLogLevels = 'info'|'success'|'warning'|'danger';
  export type JobQueueShutdownLevel = 'hard'|'soft'|'normal';

  export class JobCollection<T> extends Mongo.Collection<T> {
    // client only
    logConsole: boolean;
    // server only
    events: NodeJS.EventEmitter;
    forever: boolean;
    foreverDate: Date;
    jobPriorites: any;
    jobStatuses: string[];
    jobRetryBackoffMethods: string[];
    jobLogLevels: string[];
    jobStatusCancellable: string[];
    jobStatusPausable: string[];
    jobStatusRemovable: string[];
    jobStatusRestartable: string[];
    ddpMethods: string[];
    ddpPermissionLevels: string[];
    ddpMethodPermissions: {[key: string]: string[]};
    jobDocPattern: any;
    later: any;

    constructor(name?: string, options?: JobCollectionOption);

    // server only
    setLogStream(writeStream: any): void;

    // server only
    promote(milliseconds: number): void;

    // server only
    allow(options: any): boolean;

    // server only
    deny(options: any): boolean;

    startJobServer(options?: any, callback?: ResultCallback): void;

    shutdownJobServer(options?: {timeout?: number}, callback?: any): void;

    getJob(id: string, options?: JobOptions, callback?: (error: any, job?: Job<T>) => void): void;

    getWork(type: string|string[], options?: {maxJobs?: number;workTimeout?: number}, callback?: (error, jobs: Job<T>[]) => void): void;

    processJobs(type: string, options?: ProcessOptions | WorkerCallback<T>, worker?: WorkerCallback<T>): JobQueue;

    getJobs(ids: string[], options?: JobOptions, callback?: ResultJobsCallback<T>): void;

    readyJobs(ids: string[], options?: {}, callback?: ResultJobsCallback<T>): void;

    pauseJobs(ids: string[], options?: {}, callback?: ResultJobsCallback<T>): void;

    resumeJobs(ids: string[], options?: {}, callback?: ResultJobsCallback<T>): void;

    cancelJobs(ids: string[], options?: {}, callback?: ResultJobsCallback<T>): void;

    restartJobs(ids: string[], options?: {}, callback?: ResultCallback): void;

    removeJobs(ids: string[], options?: {}, callback?: ResultCallback): void;

    setDDP(type: string, option: ProcessOptions, callback: Function): void;
  }

  export class Job<T> {
    type: string;
    data: any;
    doc: any;

    constructor(jc: JobCollection<T>, type: string|Object, data?: Object);

    depends(dependencies?: Job<T>[]): Job<T>;

    priority(priority?: string|number): Job<T>;

    retry(options?: {retries?: number;until?: number;wait?: number;backoff?: JobRetryBackoffMethods;}): Job<T>;

    repeat(options?: {repeats?: number;until?: number;wait?: number;schedule?: any;}): Job<T>;

    delay(milliseconds?: number): Job<T>;

    after(time?: Date): Job<T>;

    log(message: string, options?: {level?: JobLogLevels;data?: any;echo?: boolean;}, callback?: ResultCallback): void;

    progress(completed, total, options?: {echo?: boolean}, cb?: ResultCallback): Job<T>;

    save(options?: {cancelRepeats?: boolean;}, callback?: ResultCallback): Job<T>;

    refresh(options?: {getLog?: boolean;getFailures?: boolean;}, callback?: ResultCallback): Job<T>;

    done(result: any, options?: {repeatId?: boolean;delayDeps?: number;}, callback?: ResultCallback): Job<T>;

    fail(error: any, options?: {fatal?: boolean}, callback?: ResultCallback): Job<T>;

    pause(options?: {}, callback?: ResultCallback): Job<T>;

    resume(options?: {}, callback?: ResultCallback): Job<T>;

    ready(options?: {time?: Date; force?: boolean;}, callback?: ResultCallback): Job<T>;

    cancel(options?: {antecedents?: boolean; dependents?: boolean;}, callback?: ResultCallback): Job<T>;

    restart(options?: {retries?: number; until?: Date; antecedents?: boolean;dependents?: boolean;}, callback?: ResultCallback): Job<T>;

    rerun(options?: {repeats?: number; until?: Date; wait?: number;}, callback?: ResultCallback): Job<T>;

    remove(options?: {}, callback?: ResultCallback): Job<T>;
  }

  export class JobQueue {
    pause(): void;

    resume(): void;

    trigger(): void;

    shutdown(options?: {level?: JobQueueShutdownLevel; quiet?: boolean}, callback?: () => void): void;

    length(): number;

    full(): boolean;

    running(): number;

    idle(): boolean;
  }
}