// A tiny round-robin worker pool. Each worker handles one task at a time;
// extra tasks queue and dispatch as workers free up. Crashes are isolated —
// a failed worker is terminated and replaced lazily on the next task.

export type WorkerMessage = { id: string } & Record<string, unknown>;

export type WorkerPoolOptions = {
  /** Factory that returns a freshly-instantiated Worker. */
  factory: () => Worker;
  /** Hard cap on simultaneous workers. Defaults to navigator.hardwareConcurrency
   *  clamped to [2, 4]. */
  maxWorkers?: number;
  /** Predicate identifying a terminal message for a task. The pool considers
   *  the worker free once this returns true. */
  isTerminal?: (message: WorkerMessage) => boolean;
};

type Task = {
  id: string;
  payload: unknown;
  transfer?: Transferable[];
  onMessage: (message: WorkerMessage) => void;
};

export class WorkerPool {
  private readonly factory: () => Worker;
  private readonly maxWorkers: number;
  private readonly isTerminal: (message: WorkerMessage) => boolean;
  private readonly workers: Worker[] = [];
  private readonly busy: Set<Worker> = new Set();
  private readonly taskByWorker: Map<Worker, Task> = new Map();
  private readonly queue: Task[] = [];

  constructor(options: WorkerPoolOptions) {
    this.factory = options.factory;
    this.maxWorkers =
      options.maxWorkers ??
      (typeof navigator !== "undefined" && navigator.hardwareConcurrency
        ? Math.min(4, Math.max(2, navigator.hardwareConcurrency - 1))
        : 3);
    this.isTerminal =
      options.isTerminal ?? ((message) => "kind" in message && (message.kind === "ready" || message.kind === "failed"));
  }

  /** Submit a task. `onMessage` fires for every message the worker emits with
   *  the matching id (intermediate steps + the terminal one). */
  send(task: Task) {
    this.queue.push(task);
    this.dispatch();
  }

  private dispatch() {
    while (this.queue.length > 0) {
      const idle = this.findIdle();
      if (idle) {
        this.assign(idle, this.queue.shift()!);
        continue;
      }
      if (this.workers.length < this.maxWorkers) {
        this.spawn();
        continue;
      }
      break;
    }
  }

  private findIdle(): Worker | undefined {
    return this.workers.find((worker) => !this.busy.has(worker));
  }

  private spawn(): Worker {
    const worker = this.factory();
    worker.addEventListener("message", (event: MessageEvent) => {
      const data = event.data as WorkerMessage | undefined;
      if (!data || typeof data.id !== "string") return;
      const task = this.taskByWorker.get(worker);
      if (!task || task.id !== data.id) return;
      task.onMessage(data);
      if (this.isTerminal(data)) {
        this.busy.delete(worker);
        this.taskByWorker.delete(worker);
        this.dispatch();
      }
    });
    worker.addEventListener("error", (event: ErrorEvent) => {
      event.preventDefault?.();
      const task = this.taskByWorker.get(worker);
      if (task) {
        task.onMessage({ id: task.id, kind: "failed", error: event.message || "Worker crashed." });
      }
      this.recycle(worker);
    });
    worker.addEventListener("messageerror", () => {
      const task = this.taskByWorker.get(worker);
      if (task) {
        task.onMessage({ id: task.id, kind: "failed", error: "Worker message could not be deserialised." });
      }
      this.recycle(worker);
    });
    this.workers.push(worker);
    return worker;
  }

  private recycle(worker: Worker) {
    this.busy.delete(worker);
    this.taskByWorker.delete(worker);
    const index = this.workers.indexOf(worker);
    if (index >= 0) this.workers.splice(index, 1);
    try {
      worker.terminate();
    } catch {
      /* noop */
    }
    this.dispatch();
  }

  private assign(worker: Worker, task: Task) {
    this.busy.add(worker);
    this.taskByWorker.set(worker, task);
    worker.postMessage(task.payload, task.transfer ?? []);
  }

  dispose() {
    this.workers.forEach((worker) => {
      try {
        worker.terminate();
      } catch {
        /* noop */
      }
    });
    this.workers.length = 0;
    this.busy.clear();
    this.taskByWorker.clear();
    this.queue.length = 0;
  }
}
