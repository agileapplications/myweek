module Resolvers
  class TaskSearchResolver < GraphQL::Schema::Resolver
    type Types::TaskSearchResultType, null: false

    argument :query, String, required: true
    argument :limit, Integer, required: false, default_value: 10
    argument :offset, Integer, required: false, default_value: 0
    argument :include_archived, Boolean, required: false, default_value: true

    Result = Struct.new(:total_count, :tasks)

    def resolve(query:, limit: 10, offset: 0, include_archived: true)
      term = query.to_s.strip
      return Result.new(0, []) if term.blank?

      like = "%#{term.downcase}%"
      scope = Task.includes(:task_list, :sub_tasks)
      scope = scope.where(archived_at: nil) unless include_archived
      scope = scope.where(
        "LOWER(tasks.title) LIKE ? OR LOWER(COALESCE(tasks.description, '')) LIKE ?",
        like,
        like
      )

      total_count = scope.count
      tasks = scope.order(:title, :id).offset(offset).limit(limit)

      Result.new(total_count, tasks)
    end
  end
end
