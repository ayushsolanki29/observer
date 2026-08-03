import { Matcher } from '../core/Matcher';
import { MatchResult } from '../core/MatchResult';
import { Monitor } from '../core/Monitor';
import { Notice } from '../core/Notice';

export class RuleMatcher implements Matcher {
  match(notice: Omit<Notice, 'hash' | 'createdAt'>, monitor: Monitor): MatchResult {
    const titleLower = notice.title.toLowerCase();
    let totalScore = 0;
    const reasons: string[] = [];

    if (monitor.matching.mustNotMatch) {
      for (const keyword of monitor.matching.mustNotMatch) {
        if (titleLower.includes(keyword.toLowerCase())) {
          return {
            matched: false,
            score: 0,
            reasons: [`Excluded by mustNotMatch rule: "${keyword}"`],
          };
        }
      }
    }

    if (monitor.matching.mustMatch && monitor.matching.mustMatch.length > 0) {
      let passedMustMatch = false;
      for (const keyword of monitor.matching.mustMatch) {
        if (titleLower.includes(keyword.toLowerCase())) {
          passedMustMatch = true;
          reasons.push(`Passed mustMatch rule: "${keyword}"`);
          break;
        }
      }
      if (!passedMustMatch) {
        return {
          matched: false,
          score: 0,
          reasons: ['Failed all mustMatch rules'],
        };
      }
    }

    if (monitor.matching.shouldMatch) {
      for (const rule of monitor.matching.shouldMatch) {
        if (titleLower.includes(rule.keyword.toLowerCase())) {
          totalScore += rule.score;
          reasons.push(`Matched shouldMatch rule: "${rule.keyword}" (+${rule.score})`);
        }
      }
    }

    const matched = totalScore >= monitor.matching.minimumScore;

    if (matched) {
      reasons.push(`Total score ${totalScore} >= minimum score ${monitor.matching.minimumScore}`);
    } else {
      reasons.push(`Total score ${totalScore} < minimum score ${monitor.matching.minimumScore}`);
    }

    return {
      matched,
      score: totalScore,
      reasons,
    };
  }
}
