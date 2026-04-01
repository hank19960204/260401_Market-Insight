import { Newspaper, ChevronRight } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui';
import type { NewsItem } from '@/types';

interface Props { news: NewsItem[] }

export function NewsTab({ news }: Props) {
  if (news.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title="尚無最新消息"
        description="管理員可在「資料管理」頁面新增情報。"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {news.map(item => (
        <Card key={item.id} className="flex flex-col h-full !p-0">
          <div className="p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <Badge variant="brand">{item.category}</Badge>
              <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-3 flex-1">{item.content}</p>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">{item.source}</span>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  閱讀全文 <ChevronRight size={13} />
                </a>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
