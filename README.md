# mermaid-security-groups

```mermaid
sequenceDiagram
  participant sg-0acf1d97b93fcc643 as Codebuild Security Group
  participant sg-0f94d1549c1910f20 as pys-prod-tailscale
  participant sg-0c122c88f901dcd7c as Metabase Security Group
  participant sg-07083535f5ece6163 as pys-prod-ecs
  participant sg-04a99f4909271444a as pys-prod-ps-prod-ecs
  participant sg-01c9de77175032b28 as pys-prod-rds
  sg-0acf1d97b93fcc643->>sg-01c9de77175032b28: tcp/3306:3306
  sg-0f94d1549c1910f20->>sg-01c9de77175032b28: tcp/3306:3306
  sg-0c122c88f901dcd7c->>sg-01c9de77175032b28: tcp/3306:3306
  sg-07083535f5ece6163->>sg-01c9de77175032b28: tcp/3306:3306
  sg-04a99f4909271444a->>sg-01c9de77175032b28: tcp/3306:3306
```

NAME

    `mermaid-security-groups` - Draw a Mermaid diagram of AWS security groups

SYNOPSIS

    `node ./index.js [--profile AWS_PROFILE] [--filter SG_ID1,SG_ID2,...]`

DESCRIPTION

    Draws a Mermaid diagram of the ingress rules for the specified
    security groups (or all groups if no `--filter` is applied.)
