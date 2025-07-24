#!/bin/bash

# Feature 목록
FEATURES=(balances products orders coupons statistics)

# 공통 디렉토리 생성
mkdir -p src/common/{exceptions,interceptors,utils}
mkdir -p src/features/{balances,products,orders,coupons,statistics}

# Feature별 디렉토리와 파일 생성
for feature in "${FEATURES[@]}"; do
  capitalized=$(echo "$feature" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')

  # Controller
  cat > src/features/$feature/${feature}.controller.ts <<EOF
import { Controller } from '@nestjs/common';
import { ${capitalized}Service } from './${feature}.service';

@Controller('${feature}')
export class ${capitalized}Controller {
  constructor(private readonly ${feature}Service: ${capitalized}Service) {}
}
EOF

  # Service
  cat > src/features/$feature/${feature}.service.ts <<EOF
import { Injectable } from '@nestjs/common';
import { ${capitalized}Repository } from './${feature}.repository';

@Injectable()
export class ${capitalized}Service {
  constructor(private readonly ${feature}Repository: ${capitalized}Repository) {}
}
EOF

  # Repository
  cat > src/features/$feature/${feature}.repository.ts <<EOF
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${capitalized}Repository {
  // TODO: DB 접근 로직 작성
}
EOF

  # DTO
  cat > src/features/$feature/${feature}.dto.ts <<EOF
export interface ${capitalized}DTO {
  // TODO: DTO 필드 정의
}
EOF

  # Module
  cat > src/features/$feature/${capitalized}.module.ts <<EOF
import { Module } from '@nestjs/common';
import { ${capitalized}Controller } from './${feature}.controller';
import { ${capitalized}Service } from './${feature}.service';
import { ${capitalized}Repository } from './${feature}.repository';

@Module({
  controllers: [${capitalized}Controller],
  providers: [${capitalized}Service, ${capitalized}Repository],
  exports: [${capitalized}Service],
})
export class ${capitalized}Module {}
EOF

  # index.ts 작성
  cat > src/features/$feature/index.ts <<EOF
export * from './${feature}.controller';
export * from './${feature}.service';
export * from './${feature}.repository';
export * from './${feature}.dto';
export * from './${feature}.module';
EOF
done

# common 폴더 index.ts
for dir in exceptions interceptors utils; do
  echo "// ${dir} exports" > src/common/$dir/index.ts
done

echo "✅ 프로젝트 기본 구조(Module 포함)와 샘플 코드가 생성되었습니다!"
