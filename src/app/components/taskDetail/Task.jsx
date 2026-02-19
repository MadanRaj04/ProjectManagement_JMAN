import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlignLeft, FiCheckSquare, FiMessageSquare } from "react-icons/fi";

const TaskDetail = ({ task, isOpen, onClose }) => {
  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm"
          />
          
          {/* Detail Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-[60] h-screen w-full max-w-2xl bg-neutral-900 border-l border-neutral-800 p-8 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <span>Projects</span> / <span>Tasks</span> / <span>{task.id}</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Content */}
              <div className="md:col-span-2 space-y-8">
                <h2 className="text-3xl font-bold text-neutral-50">{task.title}</h2>
                
                <section>
                  <div className="flex items-center gap-2 mb-3 text-neutral-300 font-semibold">
                    <FiAlignLeft /> <h3>Description</h3>
                  </div>
                  <textarea 
                    placeholder="Add a more detailed description..."
                    className="w-full bg-neutral-800 border-none rounded-md p-3 text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-violet-500 min-h-[100px]"
                  />
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3 text-neutral-300 font-semibold">
                    <FiCheckSquare /> <h3>Subtasks</h3>
                  </div>
                  <button className="text-sm bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded transition-colors text-neutral-300">
                    + Add subtask
                  </button>
                </section>

                <section>
                   <div className="flex items-center gap-2 mb-3 text-neutral-300 font-semibold">
                    <FiMessageSquare /> <h3>Activity</h3>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold">ME</div>
                    <input 
                      placeholder="Add a comment..."
                      className="flex-1 bg-neutral-800 rounded-full px-4 py-2 text-sm text-neutral-200 border-none"
                    />
                  </div>
                </section>
              </div>

              {/* Right Column: Sidebar Stats */}
              <div className="space-y-6 border-l border-neutral-800 pl-6">
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Status</label>
                  <div className="bg-neutral-800 px-3 py-1.5 rounded text-sm font-medium inline-block uppercase text-blue-300">
                    {task.column.replace("-", " ")}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Assignee</label>
                  <div className="flex items-center gap-2 text-sm text-neutral-300 hover:bg-neutral-800 p-1 rounded cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-neutral-700" /> Unassigned
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Priority</label>
                  <span className="text-sm text-neutral-300">Medium</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


export default TaskDetail;