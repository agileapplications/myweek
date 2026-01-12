module Resolvers
  class TasksResolver < GraphQL::Schema::Resolver
    type [Types::TaskType], null: false

    argument :archived, Boolean, required: false

    def resolve(archived: nil)
      scope = Task.order(:task_list_id, :position, :id)
      return scope if archived.nil?

      archived ? scope.where.not(archived_at: nil) : scope.where(archived_at: nil)
    end
  end
end
