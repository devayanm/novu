import { getV2 } from '@/api/api.client';
import { DefaultPagination } from '@/components/default-pagination';
import { Badge } from '@/components/primitives/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Skeleton } from '@/components/primitives/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/primitives/table';
import TruncatedText from '@/components/truncated-text';
import { WorkflowStatus } from '@/components/workflow-status';
import { WorkflowSteps } from '@/components/workflow-steps';
import { WorkflowTags } from '@/components/workflow-tags';
import { useEnvironment } from '@/context/environment/hooks';
import { ListWorkflowResponse, WorkflowOriginEnum } from '@novu/shared';
import { useQuery } from '@tanstack/react-query';
import { FaCode } from 'react-icons/fa6';
import { createSearchParams, useLocation, useSearchParams } from 'react-router-dom';

export const WorkflowList = () => {
  const { currentEnvironment } = useEnvironment();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const hrefFromOffset = (offset: number) => {
    return `${location.pathname}?${createSearchParams({
      ...searchParams,
      offset: offset.toString(),
    })}`;
  };
  const setLimit = (limit: number) => {
    setSearchParams((searchParams) => {
      searchParams.set('limit', limit.toString());
      return searchParams;
    });
  };

  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '12');
  const workflowsQuery = useQuery({
    queryKey: ['workflows', { environmentId: currentEnvironment?._id, limit, offset }],
    queryFn: async () => {
      const { data } = await getV2<{ data: ListWorkflowResponse }>(`/workflows?limit=${limit}&offset=${offset}`);
      return data;
    },
  });
  const currentPage = Math.floor(offset / limit) + 1;

  if (!workflowsQuery.isLoading && !workflowsQuery.data) {
    return null;
  }

  return (
    <div className="flex h-full flex-col px-6 py-2">
      <Table containerClassname="overflow-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Workflows</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Steps</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflowsQuery.isLoading ? (
            <>
              {new Array(limit).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="flex flex-col gap-1 font-medium">
                    <Skeleton className="h-5 w-[20ch]" />
                    <Skeleton className="h-3 w-[15ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[6ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[8ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[7ch] rounded-full" />
                  </TableCell>
                  <TableCell className="text-foreground-600 text-sm font-medium">
                    <Skeleton className="h-5 w-[14ch] rounded-full" />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <>
              {workflowsQuery.data.workflows.map((workflow) => (
                <TableRow key={workflow._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {workflow.origin === WorkflowOriginEnum.EXTERNAL && (
                        <Badge className="rounded-full px-1.5" variant={'warning'}>
                          <FaCode className="size-3" />
                        </Badge>
                      )}
                      <TruncatedText text={workflow.name} />
                    </div>
                    <TruncatedText className="text-foreground-400 font-code block text-xs" text={workflow._id} />
                  </TableCell>
                  <TableCell>
                    <WorkflowStatus status={workflow.status} />
                  </TableCell>
                  <TableCell>
                    <WorkflowSteps steps={workflow.stepTypeOverviews} />
                  </TableCell>
                  <TableCell>
                    <WorkflowTags tags={workflow.tags || []} />
                  </TableCell>
                  <TableCell className="text-foreground-600 text-sm font-medium">
                    {new Date(workflow.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>
              <div className="flex items-center justify-between">
                {workflowsQuery.data ? (
                  <span className="text-foreground-600 block text-sm font-normal">
                    Page {currentPage} of {Math.ceil(workflowsQuery.data.totalCount / limit)}
                  </span>
                ) : (
                  <Skeleton className="h-5 w-[20ch]" />
                )}
                {workflowsQuery.data ? (
                  <DefaultPagination
                    hrefFromOffset={hrefFromOffset}
                    totalCount={workflowsQuery.data.totalCount}
                    limit={limit}
                    offset={offset}
                  />
                ) : (
                  <Skeleton className="h-5 w-32" />
                )}
                <Select onValueChange={(v) => setLimit(parseInt(v))} defaultValue={limit.toString()}>
                  <SelectTrigger className="w-fit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};