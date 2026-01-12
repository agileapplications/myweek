class MyweekSchema < GraphQL::Schema
  use GraphQL::Dataloader

  query(Types::QueryType)
  mutation(Types::MutationType)
end
