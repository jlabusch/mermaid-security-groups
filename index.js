const { fromSSO } = require('@aws-sdk/credential-providers')
const { EC2Client, DescribeSecurityGroupsCommand } = require('@aws-sdk/client-ec2')

function parse_argv() {
  const args = {
    filter: [],
    profile: process.env.AWS_PROFILE ?? 'testing',
    region: 'ap-southeast-2'
  }
  for (let i = 1; i < process.argv.length; ++i) {
    switch (process.argv[i]) {
      case '--filter':
        ++i
        if (i < process.argv.length) {
          args.filter = process.argv[i].split(',')
        }
        break
      case '--profile':
        ++i
        if (i < process.argv.length) {
          args.profile = process.argv[i]
        }
        break
    }
  }
  return args
}

function participant(x, info) {
  let p = mermaid.participants[x]
  if (!p) {
    p = {id: x, desc: info?.desc, from_rules: 0, to_rules: 0}
    mermaid.participants[x] = p
  }

  if (info) {
    Object.keys(info).forEach(k => {
      p[k] = info[k]
    })
  }

  return mermaid.participants[x]
}

function print_mermaid(keys) {
  const p_out = []
  const s_out = []
  const used_participants = {}

  mermaid.statements
  .sort(participant_sort_fn)
  .filter(s => keys.includes(s.from) || keys.includes(s.to))
  .forEach(s => {
    used_participants[s.from] = true
    used_participants[s.to] = true
    s_out.push(`  ${s.from}->>${s.to}: ${s.text}`)
  })

  console.log('sequenceDiagram')
  Object.keys(used_participants)
  .sort(participant_sort_fn)
  .forEach(id => {
      const p = participant(id)
      console.log(`  participant ${p.id} as ${p.desc ? p.desc : p.id}`)
  })
  console.log(s_out.join('\n'))
}

// Sort first by the number of rules, then alphabetically by description
function participant_sort_fn(a, b) {
  const a_from = a.from ?? a
  const b_from = b.from ?? b
  // Order by number of edges...
  const rn = participant(b_from).from_rules - participant(a_from).from_rules
  // ... using alphabetical description to break ties
  const dn = mermaid.participants[a_from].desc ? mermaid.participants[a_from].desc.localeCompare(mermaid.participants[b_from].desc) : 0
  return rn ? rn : dn
}

const mermaid = {
  participants: {},
  statements: []
}

async function describe_security_groups(opts) {
  let ec2 = new EC2Client({
    region: opts.region,
    profile: opts.profile
  })
  let cmd = new DescribeSecurityGroupsCommand({})
  const json = await ec2.send(cmd)
  return json
}

async function main(args) {
  const json = await describe_security_groups(args)

  json.SecurityGroups.forEach(sg => {
    let p = participant(sg.GroupId, {desc: sg.Description})
    sg.IpPermissions.forEach(rule => {
      let text = rule.FromPort ? `${rule.IpProtocol}/${rule.FromPort}:${rule.ToPort}` : ''
      p.to_rules += rule.UserIdGroupPairs.length
      rule.UserIdGroupPairs.forEach(item => {
        mermaid.statements.push({to: sg.GroupId, from: item.GroupId, text: text})
        participant(item.GroupId).from_rules++
      })
    })
  })

  if (args.filter.length) {
    print_mermaid(args.filter.sort(participant_sort_fn))
  }else{
    print_mermaid(Object.keys(mermaid.participants))
  }
}

main(parse_argv())
