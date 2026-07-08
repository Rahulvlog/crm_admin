import React, { forwardRef, useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const CELL_W = 410;
const CELL_H = 450;

// Compute a tile size that matches the image's aspect ratio and fits inside the cell.
const fitToCell = (ratio) => {
  if (!ratio || !isFinite(ratio) || ratio <= 0) {
    return { w: CELL_W, h: CELL_H };
  }
  const cellRatio = CELL_W / CELL_H;
  if (ratio >= cellRatio) {
    // Landscape-ish relative to cell -> fit to width
    return { w: CELL_W, h: Math.round(CELL_W / ratio) };
  }
  // Portrait-ish relative to cell -> fit to height
  return { w: Math.round(CELL_H * ratio), h: CELL_H };
};

const ExportTaskTemplate = forwardRef(({ tasks, getImageUrl, onReady }, ref) => {
  if (!tasks || tasks.length === 0) return null;

  const totalImages = tasks.reduce((sum, t) => sum + (t.all_photos?.length || 0), 0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [aspectRatios, setAspectRatios] = useState({});

  useEffect(() => {
    if (totalImages === 0 || loadedCount >= totalImages) {
      if (onReady) onReady();
    }
  }, [loadedCount, totalImages, onReady]);

  const handleImageLoad = (e, key) => {
    const img = e?.target;
    if (img && img.naturalWidth && img.naturalHeight) {
      setAspectRatios(prev => (
        prev[key] ? prev : { ...prev, [key]: img.naturalWidth / img.naturalHeight }
      ));
    }
    setLoadedCount(prev => prev + 1);
  };

  const handleImageError = () => setLoadedCount(prev => prev + 1);

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
                {pagePhotos.map((photo, idx) => {
                  const photoKey = `${taskIndex}-${pageIndex}-${idx}`;
                  const ratio = aspectRatios[photoKey];
                  const { w: tileW, h: tileH } = fitToCell(ratio);
                  return (
                    <div
                      key={idx}
                      style={{
                        width: `${CELL_W}px`,
                        height: `${CELL_H}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div
                        className="relative border-4 border-white rounded-lg shadow-md overflow-hidden bg-slate-100"
                        style={{ width: `${tileW}px`, height: `${tileH}px` }}
                      >
                        <img
                          src={getImageUrl(photo, true)}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          crossOrigin="anonymous"
                          onLoad={(e) => handleImageLoad(e, photoKey)}
                          onError={handleImageError}
                        />

                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-4 flex gap-4 text-white items-center border-t border-white/10 text-left" style={{ zIndex: 10, lineHeight: 'normal' }}>
                          {(task.latitude || task.task_id?.latitude) && (task.longitude || task.task_id?.longitude) && (
                            <div className="shrink-0 w-16 h-16 rounded bg-slate-800 overflow-hidden flex items-center justify-center border border-white/20">
                              <MapPin size={28} className="text-rose-400" />
                            </div>
                          )}
                          <div className="flex flex-col justify-center w-full">
                            {task.gps_address && task.gps_address !== '-' && (
                              <div className="font-semibold mb-2 pb-2 border-b border-white/20 text-white text-sm leading-relaxed" style={{ wordBreak: 'break-word' }}>
                                {task.gps_address}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-mono text-[12px] mt-1 leading-snug">
                              {(task.latitude || task.task_id?.latitude) && (
                                <div>
                                  <span className="text-white/50 mr-1">Lat:</span> {task.latitude || task.task_id?.latitude}
                                </div>
                              )}
                              {(task.longitude || task.task_id?.longitude) && (
                                <div>
                                  <span className="text-white/50 mr-1">Long:</span> {task.longitude || task.task_id?.longitude}
                                </div>
                              )}
                              {task.created_date && (
                                <div className="col-span-2">
                                  <span className="text-white/50 mr-1">Date:</span> {new Date(task.created_date).toLocaleString('en-GB')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })}
      </div>
    </div>
  );
});

export default ExportTaskTemplate;
