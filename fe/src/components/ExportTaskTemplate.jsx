import React, { forwardRef, useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const ExportTaskTemplate = forwardRef(({ tasks, getImageUrl, onReady }, ref) => {
  if (!tasks || tasks.length === 0) return null;

  const totalImages = tasks.reduce((sum, t) => sum + (t.all_photos?.length || 0), 0);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (totalImages === 0 || loadedCount >= totalImages) {
      if (onReady) onReady();
    }
  }, [loadedCount, totalImages, onReady]);

  const handleImageLoad = () => setLoadedCount(prev => prev + 1);

  return (
    <div className="absolute top-0" style={{ left: '-9999px', pointerEvents: 'none' }}>
      <div ref={ref} className="flex flex-col gap-10">
        {tasks.map((task, taskIndex) => {
          const photos = task.all_photos || [];
          const pages = [];
          for (let i = 0; i < photos.length; i += 4) {
            pages.push(photos.slice(i, i + 4));
          }
          if (pages.length === 0) pages.push([]);

          const projName = task.task_id?.project_id?.title || task.project_id?.title || '-';
          const state = task.task_id?.state?.name || task.state?.name || '-';
          const district = task.task_id?.district?.name || task.district?.name || '-';
          const city = task.task_id?.city?.name || task.city?.name || '-';
          const siteLoc = task.task_id?.site_location || task.site_location || '-';
          const dealerName = task.task_id?.dealer_name?.name || task.dealer_name?.name || '-';

          return pages.map((pagePhotos, pageIndex) => (
            <div 
              key={`${taskIndex}-${pageIndex}`} 
              className="export-page bg-white p-8 relative flex flex-col" 
              style={{ width: '900px', height: '1200px', boxSizing: 'border-box' }}
            >
              {pageIndex === 0 && (
                <div className="mb-6 border-2 border-slate-300 rounded overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left text-slate-800 font-medium">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold w-1/4">Project Name:</td>
                        <td className="p-2 border-r border-slate-200 w-1/4">{projName}</td>
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold w-1/4">State:</td>
                        <td className="p-2 w-1/4">{state}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">District:</td>
                        <td className="p-2 border-r border-slate-200">{district}</td>
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">City:</td>
                        <td className="p-2">{city}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">Site Location:</td>
                        <td className="p-2 border-r border-slate-200">{siteLoc}</td>
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">Flex Range:</td>
                        <td className="p-2">-</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">Location Type:</td>
                        <td className="p-2 border-r border-slate-200">Rural/Urban</td>
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">Dealer Name:</td>
                        <td className="p-2">{dealerName}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">No. of Flex:</td>
                        <td className="p-2 border-r border-slate-200">-</td>
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">Size of Flex:</td>
                        <td className="p-2">{task.flex_size || '-'}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold">Flex ID:</td>
                        <td className="p-2 border-r border-slate-200">{task.flex_id || task.id}</td>
                        <td className="p-2 border-r border-slate-200 bg-slate-100 font-bold"></td>
                        <td className="p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 flex-grow content-start">
                {pagePhotos.map((photo, idx) => (
                  <div key={idx} className="relative border-4 border-white rounded-lg shadow-md overflow-hidden bg-slate-100" style={{ height: '450px' }}>
                    <img 
                      src={getImageUrl(photo, true)} 
                      alt="Task Photo" 
                      className="w-full h-full object-cover" 
                      crossOrigin="anonymous" 
                      onLoad={handleImageLoad}
                      onError={handleImageLoad}
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-3 flex gap-3 text-white items-center border-t border-white/10" style={{ zIndex: 10 }}>
                      {(task.latitude || task.task_id?.latitude) && (task.longitude || task.task_id?.longitude) && (
                        <div className="shrink-0 w-16 h-16 rounded bg-slate-800 overflow-hidden flex items-center justify-center border border-white/20">
                          <MapPin size={28} className="text-rose-400" />
                        </div>
                      )}
                      <div className="flex flex-col justify-center overflow-hidden w-full">
                        {task.gps_address && task.gps_address !== '-' && (
                          <div className="truncate font-semibold mb-1 pb-1 border-b border-white/20 text-white text-sm">
                            {task.gps_address}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[11px] mt-1">
                          {(task.latitude || task.task_id?.latitude) && (
                            <div className="truncate">
                              <span className="text-white/50 mr-1">Lat:</span> {task.latitude || task.task_id?.latitude}
                            </div>
                          )}
                          {(task.longitude || task.task_id?.longitude) && (
                            <div className="truncate">
                              <span className="text-white/50 mr-1">Long:</span> {task.longitude || task.task_id?.longitude}
                            </div>
                          )}
                          {task.created_date && (
                            <div className="col-span-2 truncate">
                              <span className="text-white/50 mr-1">Date:</span> {new Date(task.created_date).toLocaleString('en-GB')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ));
        })}
      </div>
    </div>
  );
});

export default ExportTaskTemplate;
